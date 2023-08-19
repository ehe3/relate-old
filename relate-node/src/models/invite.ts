import Sequelize from 'sequelize';

import db from '../config/db';

export interface InviteAttributes {
  fromId: string;
  fromUsername: string;
  id: string;
  status: string;
  toId: string;
  toUsername: string;
}

class Invite
  extends Sequelize.Model<InviteAttributes>
  implements InviteAttributes
{
  fromId!: string;
  fromUsername!: string;
  id!: string;
  status!: string;
  toId!: string;
  toUsername!: string;
}

Invite.init(
  {
    fromId: { type: Sequelize.STRING, allowNull: false, field: 'from_id' },
    fromUsername: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'from_username',
    },
    id: { type: Sequelize.STRING, primaryKey: true },
    status: { type: Sequelize.STRING, allowNull: false },
    toId: { type: Sequelize.STRING, allowNull: false, field: 'to_id' },
    toUsername: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'to_username',
    },
  },
  { sequelize: db, tableName: 'invites', timestamps: true, underscored: true }
);

export default Invite;
