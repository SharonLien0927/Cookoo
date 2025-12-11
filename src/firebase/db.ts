import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { firebaseConfig } from './config'

console.log('🔧 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log('✅ Firebase app initialized')

// Initialize Firestore
export const db = getFirestore(app)
console.log('✅ Firestore initialized')

// Initialize Storage
export const storage = getStorage(app)
console.log('✅ Storage initialized')
