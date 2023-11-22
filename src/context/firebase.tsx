export function getFirebaseConfig() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_CONFIG) return null

  const firebaseConfig = {
    ...JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!),
  }

  return firebaseConfig
}

import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  doc,
  getFirestore,
} from 'firebase/firestore'
import {
  ObservableStatus,
  ReactFireOptions,
  FirebaseAppProvider as _FirebaseAppProvider,
  FirestoreProvider as _FirestoreProvider,
  useFirebaseApp,
  useFirestore,
  useFirestoreDoc,
  useFirestoreDocData,
  useFirestoreDocDataOnce,
  useFirestoreDocOnce,
} from 'reactfire'

export { doc, getFirestore } from 'firebase/firestore'
export {
  useFirestoreCollection as useCollection,
  useFirestoreCollectionData as useCollectionData,
  useFirebaseApp,
  useFirestore,
} from 'reactfire'

function wrapPath(fn) {
  return (path: string | [string] | DocumentReference, ...args) => {
    return fn(
      typeof path == 'string' || Array.isArray(path)
        ? doc(
            useFirestore(),
            ...((Array.isArray(path) ? path : [path]) as [string])
          )
        : path,
      ...args
    )
  }
}

/**
 * Subscribe to Firestore Document changes
 */
export const useDocument = wrapPath(useFirestoreDoc) as <T = DocumentData>(
  ref: string | [string] | DocumentReference<T>,
  options?: ReactFireOptions<T>
) => ObservableStatus<DocumentSnapshot<T>>
/**
 * Get a Firestore document, but don't subscribe to changes
 */
export const useDocumentOnce = wrapPath(useFirestoreDocOnce) as <
  T = DocumentData
>(
  ref: string | [string] | DocumentReference<T>,
  options?: ReactFireOptions<T>
) => ObservableStatus<DocumentSnapshot<T>>
/**
 * Subscribe to Firestore Document changes and unwrap the document into a plain object
 */
export const useDocumentData = wrapPath(useFirestoreDocData) as <
  T = DocumentData
>(
  ref: string | [string] | DocumentReference<T>,
  options?: ReactFireOptions<T>
) => ObservableStatus<T>
/**
 * Get a Firestore document, unwrap the document into a plain object, and don't subscribe to changes
 */
export const useDocumentDataOnce = wrapPath(useFirestoreDocDataOnce) as <
  T = DocumentData
>(
  ref: string | [string] | DocumentReference<T>,
  options?: ReactFireOptions<T>
) => ObservableStatus<T>

export function FireStoreProvider({ children }) {
  return (
    <_FirestoreProvider sdk={getFirestore(useFirebaseApp())}>
      {children}
    </_FirestoreProvider>
  )
}

export function FirebaseAppProvider({ children }) {
  const firebaseConfig = getFirebaseConfig()

  return (
    <_FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FireStoreProvider>{children}</FireStoreProvider>
    </_FirebaseAppProvider>
  )
}
