import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { User } from '../user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Friend } from '../user/models/friend.model';
import { SearchContactsDto } from './dto/search-contacts.dto';
import { Op } from 'sequelize';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

const transformFriendStatus = (friend: Friend, userId: number) => {
  let status: string;

  if (friend) {
    if (friend.status === 'pending') {
      status = userId === friend.userId ? 'pendingRequest' : 'pendingAccept';
    } else {
      status = friend.status;
    }
  } else {
    status = 'notAdded';
  }
  return status;
};

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Friend) private readonly friendModel: typeof Friend,
  ) {}

  async getAll(userId: number) {
    const friendIds = (
      await this.friendModel.findAll({
        where: {
          userId,
          status: 'accepted',
        },
        attributes: ['friendId'],
      })
    ).map((f) => f.friendId);

    const friends = await this.userModel.findAll({
      attributes: userReturnAttributes,
      where: {
        id: friendIds,
      },
    });

    return friends;
  }

  async search(searchDto: SearchContactsDto) {
    return this.userModel.findAll({
      attributes: userReturnAttributes,
      where: {
        [Op.or]: [
          {
            firstName: {
              [Op.substring]: searchDto.query,
            },
          },
          {
            lastName: {
              [Op.substring]: searchDto.query,
            },
          },
          {
            phoneNumber: {
              [Op.substring]: searchDto.query,
            },
          },
        ],
      },
    });
  }

  async findOne({ userId, contactId }: { userId: number; contactId: number }) {
    const user = await this.userModel.findByPk(contactId, {
      attributes: {
        exclude: ['password'],
      },
    });
    const ownFriendRelationship = await this.friendModel.findOne({
      where: {
        userId: userId,
        friendId: contactId,
      },
    });
    let pendingFriendRelationship;
    if (!ownFriendRelationship) {
      pendingFriendRelationship = await this.friendModel.findOne({
        where: [
          {
            friendId: userId,
            userId: contactId,
          },
        ],
      });
    }

    const friend = ownFriendRelationship || pendingFriendRelationship;

    return { ...user.dataValues, status: transformFriendStatus(friend, userId) };
  }

  async sendFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
    await this.friendModel.findOrCreate({
      where: { userId: senderId, friendId: receiverId },
    });
    // Reset request if it was rejected before
    // So they could send it again if they rejected the other person
    await this.friendModel.destroy({
      where: { userId: receiverId, friendId: senderId },
    });
  }

  async cancelFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
    await this.friendModel.destroy({
      where: {
        userId: senderId,
        friendId: receiverId,
      },
    });
  }

  async acceptFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
    await this.friendModel.update(
      { status: 'accepted' },
      {
        where: {
          userId: senderId,
          friendId: receiverId,
        },
      },
    );

    const [otherFriendRecord] = await this.friendModel.findOrBuild({
      where: {
        userId: receiverId,
        friendId: senderId,
      },
    });
    otherFriendRecord.status = 'accepted';
    await otherFriendRecord.save();
  }

  async rejectFriendRequest({ senderId, receiverId }: { senderId: number; receiverId: number }) {
    await this.friendModel.update(
      { status: 'rejected' },
      {
        where: {
          userId: senderId,
          friendId: receiverId,
        },
      },
    );
  }

  async getFriendRequestList({ userId }: { userId: number }) {
    const sentRequests = await this.friendModel.findAll({
      where: {
        userId: userId,
        status: 'pending',
      },
      include: [
        {
          association: 'Target',
          attributes: userReturnAttributes,
        },
      ],
    });

    const receivedRequests = await this.friendModel.findAll({
      where: {
        friendId: userId,
        status: 'pending',
      },
      include: [
        {
          association: 'User',
          attributes: userReturnAttributes,
        },
      ],
    });

    return {
      sentRequests,
      receivedRequests,
    };
  }
}
