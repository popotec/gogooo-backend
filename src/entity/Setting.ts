import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn('increment')
  settingId!: number;

  @Column()
  settingName!: string;

  @Column()
  settingImgFileNm!: string;

  @Column()
  altTpcd!: string;
}
