// Jest manual mock for @expo/vector-icons to avoid ESM transform issues in tests
// Provide simple function components returning null; name prop used in tests if needed
export const Ionicons = (props: any) => null;
export const MaterialIcons = (props: any) => null;
export default { Ionicons, MaterialIcons };
