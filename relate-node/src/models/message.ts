import Sequelize from 'sequelize';

import db from '../config/db';

export interface MessageAttributes {
  createdAt: string;
  id: string;
  senderId: string;
  text: string;
  threadId: string;
}

class Message extends Sequelize.Model<MessageAttributes> implements Message {
  createdAt!: string;
  id!: string;
  senderId!: string;
  text!: string;
  threadId!: string;
}

Message.init(
  {
    createdAt: { type: Sequelize.DATE, allowNull: false, field: 'created_at' },
    id: { type: Sequelize.STRING, primaryKey: true },
    senderId: { type: Sequelize.STRING, allowNull: false, field: 'sender_id' },
    text: { type: Sequelize.STRING, allowNull: false },
    threadId: { type: Sequelize.STRING, allowNull: false, field: 'thread_id' },
  },
  { sequelize: db, tableName: 'messages', timestamps: false, underscored: true }
);

export default Message;
