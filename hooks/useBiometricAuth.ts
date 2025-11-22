/**
 * Biometric Authentication Hook
 * 
 * DEPRECATED: This hook now wraps BiometricAuthContext for backward compatibility.
 * New code should import useBiometricAuth directly from context/BiometricAuthContext
 * 
 * @deprecated Use context/BiometricAuthContext instead
 */

export { useBiometricAuth } from '../context/BiometricAuthContext';
export type { default as BiometricAuthContext } from '../context/BiometricAuthContext';

