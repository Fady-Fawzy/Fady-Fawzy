// Only the remote SDK boundary is simulated; the production renderers/admin run unchanged.
module.exports = function installFirebaseFixture() {
  const clone = value => JSON.parse(JSON.stringify(value));
  window.__cloud = {
    stats: { summary: { gpa: '3.89', rank: '3rd', projectsCount: 600 } },
    projects: {
      legacyNurse: { title: 'Smart Nurse Robot', year: '2026', category: 'embedded', description: 'Old copy', repoLink: 'https://github.com/fady111-f', tags: ['STM32'] },
      custom: { title: '<img src=x onerror="window.__injected=1">', description: '<script>window.__injected=2</script>', category: 'software', year: '2026', icon: '" onload="evil', repoLink: 'javascript:alert(1)', tags: ['<svg onload=alert(1)>'] }
    },
    skills: { languages: { category: 'languages', list: ['C++'] } },
    subscribers: { qa: { email: '<img src=x onerror="window.__injected=3">', timestamp: { seconds: 1780000000 } } }
  };
  window.__failCollections = [];
  window.__alerts = [];
  window.Swal = { fire: async options => { window.__alerts.push(clone(options)); return { isConfirmed: true }; } };
  const documentSnapshot = (collection, id) => ({ id, exists: Object.hasOwn(window.__cloud[collection] || {}, id), data: () => clone(window.__cloud[collection][id]), ref: docRef(collection, id) });
  const write = (collection, id, data, options) => { window.__cloud[collection] ||= {}; window.__cloud[collection][id] = options?.merge ? { ...window.__cloud[collection][id], ...clone(data) } : clone(data); };
  let counter = 0;
  function docRef(collection, id) {
    return { collection, id,
      get: async () => { if (window.__failCollections.includes(collection)) throw Error('Fixture read denied'); return documentSnapshot(collection, id); },
      set: async (data, options) => write(collection, id, data, options),
      delete: async () => { delete window.__cloud[collection][id]; }
    };
  }
  const db = {
    collection(collection) {
      return {
        doc: id => docRef(collection, id),
        get: async () => {
          if (window.__failCollections.includes(collection)) throw Error('Fixture read denied');
          const docs = Object.keys(window.__cloud[collection] || {}).map(id => documentSnapshot(collection, id));
          return { docs, empty: !docs.length, forEach: callback => docs.forEach(callback) };
        },
        orderBy() { return this; },
        add: async data => { const id = 'fixture-' + ++counter; write(collection, id, data); return docRef(collection, id); }
      };
    },
    batch() { const writes = []; return { set: (ref, data, options) => writes.push(() => write(ref.collection, ref.id, data, options)), commit: async () => { writes.forEach(fn => fn()); } }; },
    async runTransaction(callback) {
      const pending = [];
      const value = await callback({ get: ref => ref.get(), set: (ref, data) => pending.push(() => write(ref.collection, ref.id, data)) });
      pending.forEach(fn => fn()); return value;
    }
  };
  const observers = [];
  const auth = {
    currentUser: null,
    onAuthStateChanged(fn) { observers.push(fn); fn(this.currentUser); },
    async signInWithEmailAndPassword() { this.currentUser = { uid: 'fixture-owner' }; observers.forEach(fn => fn(this.currentUser)); },
    async signOut() { this.currentUser = null; observers.forEach(fn => fn(null)); }
  };
  const firestore = () => db; firestore.FieldValue = { serverTimestamp: () => ({ seconds: 1790000000 }) };
  window.firebase = { apps: [], initializeApp() { this.apps.push({}); }, firestore, auth: () => auth };
};
