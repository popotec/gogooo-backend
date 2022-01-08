import { EntityRepository, Repository } from 'typeorm';
import { Setting } from '../entity/setting';

@EntityRepository(Setting)
export class SettingRepository extends Repository<Setting> {
  public async findAll(): Promise<Setting[] | undefined> {
    return await this.createQueryBuilder('SETTING').where("SETTING.ALT_TPCD<>'3'").getMany();
  }
}
