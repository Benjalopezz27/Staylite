import type { Schema, Struct } from '@strapi/strapi';

export interface RoomDetailsAmenity extends Struct.ComponentSchema {
  collectionName: 'components_room_details_amenities';
  info: {
    displayName: 'Amenity';
    icon: 'bulletList';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface RoomDetailsFeature extends Struct.ComponentSchema {
  collectionName: 'components_room_details_features';
  info: {
    displayName: 'Feature';
    icon: 'star';
  };
  attributes: {
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'room-details.amenity': RoomDetailsAmenity;
      'room-details.feature': RoomDetailsFeature;
    }
  }
}
