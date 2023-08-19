import Sequelize from 'sequelize';

import db from '../config/db';

interface DailyQuestionAttributes {
  id: number;
  date: string;
  question: string;
}

class DailyQuestion
  extends Sequelize.Model<DailyQuestionAttributes>
  implements DailyQuestionAttributes
{
  id!: number;
  date!: string;
  question!: string;
}

DailyQuestion.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: Sequelize.STRING, allowNull: false },
    question: { type: Sequelize.STRING, allowNull: false },
  },
  {
    sequelize: db,
    tableName: 'daily_questions',
    timestamps: false,
    underscored: true,
  }
);

export default DailyQuestion;
