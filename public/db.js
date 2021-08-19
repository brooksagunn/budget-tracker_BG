let db;
let budgetVersion;

const req = indexedDB.open('BudgetDB', budgetVersion || 21);

req.onupgradeneeded = e => {
    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;

    console.log(`DB version replaced: ${oldVersion} -> ${newVersion}`);

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement : true });
    }
}

req.onerror = e => console.log(`Error occurred: ${e.target.errorCode}`);

req.onsuccess = e => {
    console.log('Request resolved.');
    db = e.target.result;

    if (navigator.onLine) {
        console.log('Connected to backend.');
        checkDB();
    }
}

const checkDB = () => {
    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json' 
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.length !== 0) {
                    transaction = db.transaction(['BudgetStore'], 'readwrite');

                    const currentStore = transaction.objectStore('BudgetStore');
                    currentStore.clear();
                    console.log('Current store cleared.');
                }
            })
        }
    }
}

const saveRecord = record => {
    console.log('Saving record...');

    const transaction = db.transaction(['BudgetStore'], 'readwrite');
    const store = transaction.objectStore('BudgetStore');

    store.add(record);
}

window.addEventListener('online', checkDB);