package com.laptrinhweb.laptrinhweb.converter;

import com.laptrinhweb.laptrinhweb.dto.response.ItemResponse;
import com.laptrinhweb.laptrinhweb.dto.response.ProductResponse;
import com.laptrinhweb.laptrinhweb.entity.ItemEntity;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ItemMapper {


    ItemResponse toItemResponse(ItemEntity itemEntity);

}
