// src/lib/productService.ts
// Unified product service: uses Firestore when configured, otherwise falls back to localStorage.
// Exports: fetchProducts, addProduct, updateProduct, deleteProduct

import type { Product } from '../types';
import { isFirebaseConfigured, db } from './firebase';

// Firestore imports (safe to import; used only when configured)
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'maha_products';
const PRODUCTS_COLLECTION = 'products';

/**
 * LocalStorage helpers (persistent on client)
 */
function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Product[];
  } catch (e) {
    console.error('Failed to parse local products:', e);
    return [];
  }
}

function writeLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to write local products:', e);
  }
}

/**
 * Public API
 */

export async function fetchProducts(): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    // Firestore branch
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }) as Product);
  } else {
    // LocalStorage fallback
    return Promise.resolve(readLocalProducts());
  }
}

/**
 * Add product:
 * - Firestore: returns new doc id
 * - localStorage: returns generated id (string)
 */
export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const now = new Date().toISOString();
  if (isFirebaseConfigured && db) {
    const payload = { ...product, createdAt: now };
    const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
    return ref.id;
  } else {
    const products = readLocalProducts();
    const id = `prod_${Date.now()}`;
    const newProd: Product = { ...product, id, createdAt: now } as Product;
    products.unshift(newProd);
    writeLocalProducts(products);
    return Promise.resolve(id);
  }
}

/**
 * Update product: requires product.id
 */
export async function updateProduct(product: Product): Promise<void> {
  if (!product.id) throw new Error('Missing product id for update');
  if (isFirebaseConfigured && db) {
    const { id, ...data } = product as any;
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, data);
    return;
  } else {
    const products = readLocalProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx === -1) throw new Error('Product not found (local)');
    products[idx] = { ...products[idx], ...product };
    writeLocalProducts(products);
    return;
  }
}

/**
 * Delete product by id
 */
export async function deleteProduct(productId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return;
  } else {
    const products = readLocalProducts();
    const filtered = products.filter((p) => p.id !== productId);
    writeLocalProducts(filtered);
    return;
  }
}
