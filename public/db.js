const db;
const budgetVersion;

const req = indexedDB.open('BudgetDB', budgetVersion || 21);

req.onupgradeneeded = e => {
    const { oldVersion } = e;
    const newVersion = e.newVersion || db.newVersion;

    console.log(`DB version replaced: ${oldVersion} -> ${newVersion}`);

    db = e.target.result;

    if (db.objectStoreNames) db.createObjectStore('BudgetStore', { autoIncrement : true });
}

req.onerror = e => console.log(`Error occured: ${e.target.errorCode}`);

req.onsuccess = e => {
    console.log('Request resolved.');
    db = e.target.result;

    if (navigator.onLine) {
        console.log('Connected to backend.');
        checkDatabase();
    }
}