import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({
  tableName: 'categories',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['slug'] },
    { fields: ['parent_id'] },
    { fields: ['position'] },
  ],
})
export class Category extends Model<Category> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(160))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare slug: string;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column({ field: 'parent_id', type: DataType.UUID })
  declare parentId: string | null;

  @BelongsTo(() => Category, 'parentId')
  declare parent?: Category;

  @HasMany(() => Category, 'parentId')
  declare children?: Category[];

  @AllowNull(true)
  @Column({ field: 'icon_url', type: DataType.STRING(500) })
  declare iconUrl: string | null;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare position: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;
}
