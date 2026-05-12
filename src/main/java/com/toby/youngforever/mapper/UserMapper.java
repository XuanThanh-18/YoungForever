package com.toby.youngforever.mapper;

import com.toby.youngforever.dto.response.UserResponse;
import com.toby.youngforever.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
}
