# Firestore Setup Instructions

## Security Rules

Replace your Firestore security rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Admin can read all pending withdrawals
    match /pending_withdrawals/{withdrawalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
  }
}
```

## Required Indexes

The application uses simplified queries to avoid complex indexing. However, if you want optimal performance, you can create these indexes in the Firebase Console:

### Collection: `transactions`
1. **Composite Index 1:**
   - Collection ID: `transactions`
   - Fields indexed:
     - `userId` (Ascending)
     - `timestamp` (Descending)

2. **Composite Index 2:**
   - Collection ID: `transactions`
   - Fields indexed:
     - `userId` (Ascending)
     - `type` (Ascending)
     - `timestamp` (Descending)

### Collection: `pending_withdrawals`
1. **Composite Index:**
   - Collection ID: `pending_withdrawals`
   - Fields indexed:
     - `status` (Ascending)
     - `createdAt` (Descending)

## How to Apply

1. **Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - Replace the existing rules with the rules above
   - Click "Publish"

2. **Indexes:**
   - Go to Firebase Console → Firestore Database → Indexes
   - Click "Create Index"
   - Add the fields as specified above
   - Wait for indexes to build (may take a few minutes)

## Alternative: Auto-Create Indexes

If you don't want to manually create indexes, the application will show links in the console to auto-create them when needed. Simply:

1. Check the browser console for index creation links
2. Click the links to automatically create the required indexes
3. Wait for them to build

## Testing Without Indexes

The current implementation will work without indexes but may be slower with large datasets. For development and testing, the simplified queries should work fine.
