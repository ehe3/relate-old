import Sequelize from 'sequelize';

import db from '../config/db';

import Invite from './invite';

export interface UserAttributes {
  accountType: string;
  appleSub?: string;
  email: string;
  id: string;
  name?: string;
  partnerId?: string | null;
  refreshToken?: string;
  username?: string;
}

class User extends Sequelize.Model<UserAttributes> implements UserAttributes {
  accountType!: string;
  appleSub?: string;
  email!: string;
  id!: string;
  name?: string;
  partnerId?: string;
  refreshToken?: string;
  username?: string;

  public readonly partner?: User;
  public readonly outstandingInvite?: Invite;
  public readonly inboundInvites?: Invite[];
  public static associations: {
    partner: Sequelize.Association<User, User>;
    outstandingInvite: Sequelize.Association<User, Invite>;
    inboundInvites: Sequelize.Association<User, Invite>;
  };
}

User.init(
  {
    accountType: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'account_type',
    },
    appleSub: { type: Sequelize.STRING, allowNull: true, field: 'apple_sub' },
    email: { type: Sequelize.STRING, allowNull: false },
    id: { type: Sequelize.STRING, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: true },
    partnerId: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'partner_id',
    },
    refreshToken: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'refresh_token',
    },
    username: { type: Sequelize.STRING, allowNull: true, unique: true },
  },
  { sequelize: db, tableName: 'users', timestamps: true, underscored: true }
);

User.hasOne(User, { sourceKey: 'partnerId', foreignKey: 'id', as: 'partner' });
User.hasOne(Invite, {
  sourceKey: 'id',
  foreignKey: 'fromId',
  as: 'outstandingInvite',
});
User.hasMany(Invite, {
  sourceKey: 'id',
  foreignKey: 'toId',
  as: 'inboundInvites',
});

export default User;
