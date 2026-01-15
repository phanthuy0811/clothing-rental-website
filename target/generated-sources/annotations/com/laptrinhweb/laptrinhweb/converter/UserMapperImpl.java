package com.laptrinhweb.laptrinhweb.converter;

import com.laptrinhweb.laptrinhweb.dto.request.UserCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.UserResponse;
import com.laptrinhweb.laptrinhweb.entity.Role;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserEntity toUser(UserCreationRequest userCreationRequest) {
        if ( userCreationRequest == null ) {
            return null;
        }

        UserEntity.UserEntityBuilder userEntity = UserEntity.builder();

        userEntity.userName( userCreationRequest.getUserName() );
        userEntity.fullName( userCreationRequest.getFullName() );
        userEntity.email( userCreationRequest.getEmail() );
        userEntity.password( userCreationRequest.getPassword() );

        return userEntity.build();
    }

    @Override
    public UserResponse toUserResponse(UserEntity userEntity) {
        if ( userEntity == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        Set<Role> set = userEntity.getRoles();
        if ( set != null ) {
            userResponse.roles( new LinkedHashSet<Role>( set ) );
        }
        userResponse.phone( userEntity.getPhone() );
        userResponse.avatarUrl( userEntity.getAvatarUrl() );
        userResponse.id( userEntity.getId() );
        userResponse.userName( userEntity.getUserName() );
        userResponse.email( userEntity.getEmail() );
        userResponse.fullName( userEntity.getFullName() );

        return userResponse.build();
    }
}
