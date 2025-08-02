import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  // CreateDateColumn,
  // UpdateDateColumn,
} from "typeorm";

export class BaseEntity {
  @Column("bigint", {
    name: "created_at",
    nullable: true,
    default: new Date().getTime().toString(),
  })
  created_at: string;

  @Column("bigint", {
    name: "updated_at",
    nullable: true,
    default: new Date().getTime().toString(),
  })
  updated_at: string;

  @BeforeInsert()
  beforeInsert() {
    if (!this.created_at) {
      this.created_at = new Date().getTime().toString();
      this.updated_at = new Date().getTime().toString();
    }
  }

  @BeforeUpdate()
  beforeUpdated() {
    this.updated_at = new Date().getTime().toString();
  }
}
