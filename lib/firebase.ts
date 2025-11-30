import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore helper functions
export const firestoreHelpers = {
    // Users collection
    async createUser(userId: string, userData: any) {
        await setDoc(doc(db, 'users', userId), {
            ...userData,
            createdAt: Timestamp.now()
        });
    },

    async getUser(userId: string) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
    },

    async updateUser(userId: string, userData: any) {
        await setDoc(doc(db, 'users', userId), userData, { merge: true });
    },

    // Chat history collection
    async addChatMessage(userId: string, role: 'user' | 'model', text: string) {
        await addDoc(collection(db, 'chat_history'), {
            userId,
            role,
            text,
            createdAt: Timestamp.now()
        });
    },

    async getChatHistory(userId: string, limit: number = 20) {
        const q = query(
            collection(db, 'chat_history'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            // limit is applied after orderBy
        );
        const querySnapshot = await getDocs(q);
        const messages: any[] = [];
        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return messages.slice(0, limit);
    },

    async clearChatHistory(userId: string) {
        const q = query(
            collection(db, 'chat_history'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((document) =>
            deleteDoc(doc(db, 'chat_history', document.id))
        );
        await Promise.all(deletePromises);
    }
};

export { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, Timestamp };
