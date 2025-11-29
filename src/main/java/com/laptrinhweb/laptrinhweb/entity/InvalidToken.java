package com.laptrinhweb.laptrinhweb.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;

@Entity
@Getter
@Setter
public class InvalidToken {
    @Id
    String id;
    Date expireTime;
}
