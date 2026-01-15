package com.laptrinhweb.laptrinhweb.converter;

import com.laptrinhweb.laptrinhweb.dto.request.ProductCreationRequest;
import com.laptrinhweb.laptrinhweb.dto.response.ProductResponse;
import com.laptrinhweb.laptrinhweb.entity.ProductEntity;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductEntity toProductEntity(ProductCreationRequest productCreationRequest) {
        if ( productCreationRequest == null ) {
            return null;
        }

        ProductEntity.ProductEntityBuilder productEntity = ProductEntity.builder();

        productEntity.name( productCreationRequest.getName() );
        productEntity.price( productCreationRequest.getPrice() );

        return productEntity.build();
    }

    @Override
    public ProductResponse toProductResponse(ProductEntity productEntity) {
        if ( productEntity == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.quantity( productEntity.getQuantity() );
        if ( productEntity.getId() != null ) {
            productResponse.id( productEntity.getId() );
        }
        productResponse.name( productEntity.getName() );
        productResponse.price( productEntity.getPrice() );
        productResponse.imageUrl( productEntity.getImageUrl() );

        return productResponse.build();
    }
}
