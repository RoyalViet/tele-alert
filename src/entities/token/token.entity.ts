import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Entities
import { BaseEntity } from "../base/base.entity";

@Entity("token_info", { orderBy: { id: "DESC" } })
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ type: "varchar", default: "" })
  token_contract: string;

  @Column({ type: "varchar", default: "" })
  token_account_ids: string;

  @Column({ type: "varchar", default: "" })
  token_symbols: string;

  @Column({ type: "double", nullable: false, default: 0 })
  token_price: number;

  @Column({ type: "float", nullable: false, default: 0 })
  liq: number;

  @Column({ type: "int", nullable: false, default: 0 })
  pool_id: number;

  @Column({ type: "varchar", nullable: false, default: "" })
  network: string;
}
