import Sequelize from 'sequelize';

import db from '../config/db';

export interface ThreadAttributes {
  dailyQuestionId: string;
  id: string;
  partner1Id: string;
  partner2Id: string;
}

class Thread
  extends Sequelize.Model<ThreadAttributes>
  implements ThreadAttributes
{
  dailyQuestionId!: string;
  id!: string;
  partner1Id!: string;
  partner2Id!: string;
}

Thread.init(
  {
    dailyQuestionId: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'daily_question_id',
    },
    id: { type: Sequelize.STRING, primaryKey: true },
    partner1Id: {
      type: Sequelize.STRING,
      primaryKey: true,
      field: 'partner_1_id',
    },
    partner2Id: {
      type: Sequelize.STRING,
      primaryKey: true,
      field: 'partner_2_id',
    },
  },
  { sequelize: db, tableName: 'threads', timestamps: true, underscored: true }
);

export default Thread;
