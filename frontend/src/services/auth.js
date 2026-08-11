import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebaseClient'

const authMessages = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-credential': 'The email address or password is incorrect.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
  'auth/weak-password': 'Use a stronger password with at least six characters.',
}

export async function registerAccount({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  return credential.user
}

export async function loginAccount({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export function logoutAccount() {
  return signOut(auth)
}

export function getAuthError(error) {
  return authMessages[error.code] || 'Authentication failed. Please try again.'
}
