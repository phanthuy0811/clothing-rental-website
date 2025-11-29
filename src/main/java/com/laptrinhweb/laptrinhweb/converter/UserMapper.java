package com.laptrinhweb.laptrinhweb.converter;

import com.laptrinhweb.laptrinhweb.dto.request.UserCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.UserResponse;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    UserEntity toUser(UserCreationRequest userCreationRequest);

    @Mapping(source = "roles", target = "roles")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "avatarUrl", target = "avatarUrl")
    UserResponse toUserResponse(UserEntity userEntity);
}
