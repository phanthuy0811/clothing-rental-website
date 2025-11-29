package com.laptrinhweb.laptrinhweb.converter;


import com.laptrinhweb.laptrinhweb.dto.request.ProductCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.ProductResponse;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    ProductEntity toProductEntity(ProductCreationRequest productCreationRequest);

    @Mapping(source = "quantity", target = "quantity")
    ProductResponse toProductResponse(ProductEntity productEntity);
}
