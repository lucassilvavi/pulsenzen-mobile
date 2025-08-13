// Jest manual mock for @expo/vector-icons to avoid ESM transform issues in tests
import React from 'react';

function createIcon(family: string){
  return ({ name, size = 16, color = '#000', ...rest }: any) => (
    React.createElement('Text', { 'data-icon-family': family, 'data-icon': name, style: { fontSize: size, color }, ...rest }, name)
  );
}

export const Ionicons = createIcon('Ionicons');
export const MaterialIcons = createIcon('MaterialIcons');
export default { Ionicons, MaterialIcons };
