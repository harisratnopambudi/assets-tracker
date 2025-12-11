// Firestore Service for Asset Tracker
import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import type { Asset, FamilyMember } from './types';

// Collection names
const MEMBERS_COLLECTION = 'members';
const ASSETS_COLLECTION = 'assets';

// ===== MEMBERS =====

export async function getMembers(): Promise<FamilyMember[]> {
    try {
        const querySnapshot = await getDocs(collection(db, MEMBERS_COLLECTION));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FamilyMember[];
    } catch (error) {
        console.error('Error getting members:', error);
        return [];
    }
}

export async function addMember(member: FamilyMember): Promise<void> {
    try {
        await setDoc(doc(db, MEMBERS_COLLECTION, member.id), member);
    } catch (error) {
        console.error('Error adding member:', error);
        throw error;
    }
}

export async function updateMember(id: string, updates: Partial<FamilyMember>): Promise<void> {
    try {
        await updateDoc(doc(db, MEMBERS_COLLECTION, id), updates);
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
}

export async function deleteMember(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting member:', error);
        throw error;
    }
}

// Real-time listener for members
export function subscribeMembersChanges(
    callback: (members: FamilyMember[]) => void
): Unsubscribe {
    return onSnapshot(
        collection(db, MEMBERS_COLLECTION),
        (snapshot) => {
            const members = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FamilyMember[];
            callback(members);
        },
        (error) => {
            console.error('Error listening to members:', error);
        }
    );
}

// ===== ASSETS =====

export async function getAssets(): Promise<Asset[]> {
    try {
        const q = query(collection(db, ASSETS_COLLECTION), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Asset[];
    } catch (error) {
        console.error('Error getting assets:', error);
        return [];
    }
}

export async function addAsset(asset: Asset): Promise<void> {
    try {
        await setDoc(doc(db, ASSETS_COLLECTION, asset.id), asset);
    } catch (error) {
        console.error('Error adding asset:', error);
        throw error;
    }
}

export async function updateAsset(id: string, updates: Partial<Asset>): Promise<void> {
    try {
        await updateDoc(doc(db, ASSETS_COLLECTION, id), updates as any);
    } catch (error) {
        console.error('Error updating asset:', error);
        throw error;
    }
}

export async function deleteAsset(id: string): Promise<void> {
    try {
        await deleteDoc(doc(db, ASSETS_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting asset:', error);
        throw error;
    }
}

// Real-time listener for assets
export function subscribeAssetsChanges(
    callback: (assets: Asset[]) => void
): Unsubscribe {
    return onSnapshot(
        collection(db, ASSETS_COLLECTION),
        (snapshot) => {
            const assets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Asset[];
            // Sort by updatedAt desc
            assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
            callback(assets);
        },
        (error) => {
            console.error('Error listening to assets:', error);
        }
    );
}

// ===== BULK OPERATIONS =====

export async function initializeDefaultData(
    defaultMembers: FamilyMember[],
    defaultAssets: Asset[]
): Promise<void> {
    try {
        // Check if members exist
        const existingMembers = await getMembers();

        if (existingMembers.length === 0) {
            // Add default members
            for (const member of defaultMembers) {
                await addMember(member);
            }

            // Add default assets
            for (const asset of defaultAssets) {
                await addAsset(asset);
            }

            console.log('Default data initialized in Firestore');
        }
    } catch (error) {
        console.error('Error initializing default data:', error);
    }
}

// Delete all assets for a member
export async function deleteAssetsByOwner(ownerId: string): Promise<void> {
    try {
        const assets = await getAssets();
        const memberAssets = assets.filter(a => a.ownerId === ownerId);

        for (const asset of memberAssets) {
            await deleteAsset(asset.id);
        }
    } catch (error) {
        console.error('Error deleting assets by owner:', error);
        throw error;
    }
}
