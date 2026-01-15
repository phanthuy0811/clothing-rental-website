package com.laptrinhweb.laptrinhweb.converter;

import com.laptrinhweb.laptrinhweb.dto.response.ItemResponse;
import com.laptrinhweb.laptrinhweb.entity.ItemEntity;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.6 (Oracle Corporation)"
)
@Component
public class ItemMapperImpl implements ItemMapper {

    @Override
    public ItemResponse toItemResponse(ItemEntity itemEntity) {
        if ( itemEntity == null ) {
            return null;
        }

        ItemResponse.ItemResponseBuilder itemResponse = ItemResponse.builder();

        itemResponse.XL( itemEntity.getXL() );

        return itemResponse.build();
    }
}
