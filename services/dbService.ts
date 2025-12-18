import { CallLog, Customer, EmailMessage, AdminProfile, Tenant, Transaction, PlanTier, Appointment, Task, Job, Worker, PaymentMethod } from '../types';
import { MOCK_CALLS, MOCK_CUSTOMERS, MOCK_EMAILS, MOCK_ADMIN_PROFILE, MOCK_JOBS, MOCK_WORKERS, MOCK_TENANTS } from '../constants';

const STORAGE_KEYS = {
  CUSTOMERS: 'nexus_db_customers',
  CALLS: 'nexus_db_calls',
  EMAILS: 'nexus_db_emails',
  ADMIN: 'nexus_db_admin_profile',
  TENANTS: 'nexus_db_tenants',
  TRANSACTIONS: 'nexus_db_transactions',
  PLANS: 'nexus_db_plans',
  APPOINTMENTS: 'nexus_db_appointments',
  TASKS: 'nexus_db_tasks',
  JOBS: 'nexus_db_jobs',
  WORKERS: 'nexus_db_workers'
};

// SECURITY NOTE: In a production environment, data should never be stored in LocalStorage.
// Use a secure backend (PostgreSQL/MongoDB) with proper encryption at rest and in transit.
// The previous "obfuscation" logic has been removed as it provided false security (security through obscurity).

const loadFromStorage = (key: string, defaultValue: any) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        console.warn(`Failed to load ${key} from storage`, e);
        return defaultValue;
    }
};

const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save ${key} to storage`, e);
    }
};

const DEFAULT_PLANS: PlanTier[] = [
  {
    id: 'Email Only',
    name: 'Email Only',
    price: 100,
    period: 'week',
    description: 'Perfect for businesses that just need to automate their inbox.',
    features: [
      { text: 'AI Email Drafts', included: true },
      { text: 'Smart Templates', included: true },
      { text: 'Email Analytics', included: true },
      { text: 'CRM Integration', included: true },
      { text: 'AI Receptionist', included: false },
      { text: 'Call Recording', included: false },
      { text: 'Voice Transcription', included: false },
    ]
  },
  {
    id: 'Receptionist Only',
    name: 'Receptionist Only',
    price: 400,
    period: 'week',
    description: 'Automate your phone lines with a human-like AI voice agent.',
    features: [
      { text: 'AI Voice Receptionist', included: true },
      { text: '24/7 Call Handling', included: true },
      { text: 'Call Recording & Transcripts', included: true },
      { text: 'Appointment Booking', included: true },
      { text: 'AI Email Drafts', included: false },
      { text: 'Email Analytics', included: false },
      { text: 'Smart Templates', included: false },
    ]
  },
  {
    id: 'Pro Bundle',
    name: 'Pro Bundle',
    price: 500,
    period: 'week',
    description: 'The complete package. Automate everything and save time.',
    highlight: false,
    features: [
      { text: 'AI Voice Receptionist', included: true },
      { text: 'AI Email Automation', included: true },
      { text: 'Unified CRM Dashboard', included: true },
      { text: 'Advanced Analytics', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Unlimited Storage', included: true },
      { text: 'Job Allocation', included: false },
    ]
  },
  {
    id: 'Business Elite',
    name: 'Business Elite',
    price: 700,
    period: 'week',
    description: 'The ultimate power suite. Includes AI Field Operations & Dispatch.',
    highlight: true,
    features: [
      { text: 'Everything in Pro Bundle', included: true },
      { text: 'Job Allocation & Dispatch', included: true },
      { text: 'Worker Management', included: true },
      { text: 'SMS Job Alerts', included: true },
      { text: 'Real-time Status Tracking', included: true },
      { text: 'Priority 24/7 Support', included: true },
      { text: 'Dedicated Account Manager', included: true },
    ]
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [];
const MOCK_APPOINTMENTS: Appointment[] = [];
const MOCK_TASKS: Task[] = [];


export const initDB = () => {
  // Ensure strict initialization order
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CALLS)) {
    saveToStorage(STORAGE_KEYS.CALLS, MOCK_CALLS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMAILS)) {
    saveToStorage(STORAGE_KEYS.EMAILS, MOCK_EMAILS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
    saveToStorage(STORAGE_KEYS.ADMIN, MOCK_ADMIN_PROFILE);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    saveToStorage(STORAGE_KEYS.TENANTS, MOCK_TENANTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, MOCK_TRANSACTIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    saveToStorage(STORAGE_KEYS.TASKS, MOCK_TASKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    saveToStorage(STORAGE_KEYS.JOBS, MOCK_JOBS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
    saveToStorage(STORAGE_KEYS.WORKERS, MOCK_WORKERS);
  }

  // --- MIGRATION LOGIC FOR EXISTING USERS ---
  // Force update plans if "Business Elite" is missing
  const currentPlans = loadFromStorage(STORAGE_KEYS.PLANS, null);
  if (!currentPlans || !currentPlans.find((p: PlanTier) => p.id === 'Business Elite')) {
      console.log("Migrating Plans: Adding Business Elite");
      saveToStorage(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
  }
};

// --- NEW REGISTRATION FUNCTION ---
export const registerUser = (userData: { name: string; email: string; companyName: string; plan: string }) => {
    // 1. Create new Admin Profile
    const newProfile: AdminProfile = {
        id: generateId(),
        name: userData.name,
        email: userData.email,
        phone: '',
        role: 'Business Owner',
        accessLevel: 'tenant_admin', // New users are tenant admins, not super admins
        companyName: userData.companyName,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
        plan: userData.plan as any,
        credits: 0,
        billing: {
            last4: '4242', // Mock
            brand: 'Visa',
            expiry: '12/28',
            nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
    };
    updateAdminProfile(newProfile);

    // 2. Add to Tenants List (so they exist in the ecosystem)
    const newTenant: Tenant = {
        id: newProfile.id,
        businessName: userData.companyName,
        ownerName: userData.name,
        email: userData.email,
        plan: userData.plan as any,
        status: 'Active',
        joinedDate: new Date().toLocaleDateString(),
        mrr: DEFAULT_PLANS.find(p => p.id === userData.plan)?.price || 0,
        billingCycle: 'weekly',
        nextBillingDate: newProfile.billing.nextBillingDate,
        paymentMethods: [
            { id: generateId(), type: 'card', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true }
        ],
        autoPay: true
    };
    addTenant(newTenant);
};

export const getAllCustomers = (): Customer[] => loadFromStorage(STORAGE_KEYS.CUSTOMERS, []);
export const bulkAddCustomers = (newCustomers: Customer[]) => {
  const existing = getAllCustomers();
  const updated = [...newCustomers, ...existing]; 
  saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
  return updated;
};

// --- CUSTOMER PAYMENT HELPERS ---
export const addCustomerPaymentMethod = (customerId: string, method: PaymentMethod) => {
    const customers = getAllCustomers();
    const updated = customers.map(c => {
        if (c.id === customerId) {
            const newMethods = method.isDefault 
                ? c.paymentMethods.map(pm => ({...pm, isDefault: false})) 
                : [...c.paymentMethods];
            return {
                ...c,
                paymentMethods: [...newMethods, method]
            };
        }
        return c;
    });
    saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
};

export const toggleCustomerAutoPay = (customerId: string, enabled: boolean) => {
    const customers = getAllCustomers();
    const updated = customers.map(c => 
        c.id === customerId ? { ...c, autoPay: enabled } : c
    );
    saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
};

export const deleteCustomerPaymentMethod = (customerId: string, methodId: string) => {
    const customers = getAllCustomers();
    const updated = customers.map(c => {
        if (c.id === customerId) {
            return {
                ...c,
                paymentMethods: c.paymentMethods.filter(pm => pm.id !== methodId)
            };
        }
        return c;
    });
    saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
    return updated;
};

// --- TENANT PAYMENT HELPERS (META ADMIN) ---
export const addTenantPaymentMethod = (tenantId: string, method: PaymentMethod) => {
    const tenants = getAllTenants();
    const updated = tenants.map(t => {
        if (t.id === tenantId) {
            const newMethods = method.isDefault 
                ? t.paymentMethods.map(pm => ({...pm, isDefault: false})) 
                : [...t.paymentMethods];
            return {
                ...t,
                paymentMethods: [...newMethods, method]
            };
        }
        return t;
    });
    saveToStorage(STORAGE_KEYS.TENANTS, updated);
    return updated;
};

export const toggleTenantAutoPay = (tenantId: string, enabled: boolean) => {
    const tenants = getAllTenants();
    const updated = tenants.map(t => 
        t.id === tenantId ? { ...t, autoPay: enabled } : t
    );
    saveToStorage(STORAGE_KEYS.TENANTS, updated);
    return updated;
};

export const deleteTenantPaymentMethod = (tenantId: string, methodId: string) => {
    const tenants = getAllTenants();
    const updated = tenants.map(t => {
        if (t.id === tenantId) {
            return {
                ...t,
                paymentMethods: t.paymentMethods.filter(pm => pm.id !== methodId)
            };
        }
        return t;
    });
    saveToStorage(STORAGE_KEYS.TENANTS, updated);
    return updated;
};

export const getAllCalls = (): CallLog[] => loadFromStorage(STORAGE_KEYS.CALLS, []);
export const getCallsByCustomerId = (customerId: string): CallLog[] => {
  const calls = getAllCalls();
  return calls.filter(c => c.customerId === customerId);
};
export const addCallLog = (call: CallLog) => {
  const calls = getAllCalls();
  const updatedCalls = [call, ...calls];
  saveToStorage(STORAGE_KEYS.CALLS, updatedCalls);
  return updatedCalls;
};

export const getAllEmails = (): EmailMessage[] => loadFromStorage(STORAGE_KEYS.EMAILS, []);
export const getEmailsByCustomerEmail = (email: string): EmailMessage[] => {
  if (!email) return [];
  const emails = getAllEmails();
  return emails.filter(e => e.email?.toLowerCase() === email.toLowerCase());
};

export const sendOutboundEmail = (toEmail: string, customerName: string, subject: string, content: string) => {
    const newEmail: EmailMessage = {
        id: generateId(),
        sender: 'NexusAI System', 
        email: toEmail,
        subject: subject,
        preview: content.substring(0, 50) + '...',
        content: content,
        date: 'Just now',
        read: true 
    };
    
    const emails = getAllEmails();
    const updated = [newEmail, ...emails];
    saveToStorage(STORAGE_KEYS.EMAILS, updated);
    return updated;
};

export const getAdminProfile = (): AdminProfile => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN);
  return stored ? JSON.parse(stored) : MOCK_ADMIN_PROFILE;
};
export const updateAdminProfile = (profile: AdminProfile) => {
  saveToStorage(STORAGE_KEYS.ADMIN, profile);
};
export const addStoreCredit = (amount: number) => {
    const profile = getAdminProfile();
    profile.credits = (profile.credits || 0) + amount;
    updateAdminProfile(profile);
    addTransaction({
        id: generateId(),
        tenantId: profile.id,
        tenantName: profile.companyName,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'succeeded',
        type: 'credit_adjustment',
        paymentMethod: 'System Credit'
    });
};

export const getAllPlans = (): PlanTier[] => loadFromStorage(STORAGE_KEYS.PLANS, DEFAULT_PLANS);
export const updatePlans = (plans: PlanTier[]) => {
    saveToStorage(STORAGE_KEYS.PLANS, plans);
}

export const getAllTenants = (): Tenant[] => loadFromStorage(STORAGE_KEYS.TENANTS, []);
export const updateTenants = (tenants: Tenant[]) => saveToStorage(STORAGE_KEYS.TENANTS, tenants);
export const addTenant = (tenant: Tenant) => {
    const tenants = getAllTenants();
    const updated = [tenant, ...tenants];
    saveToStorage(STORAGE_KEYS.TENANTS, updated);
    return updated;
};

export const getAllTransactions = (): Transaction[] => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
export const addTransaction = (transaction: Transaction) => {
    const txs = getAllTransactions();
    const updated = [transaction, ...txs];
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    return updated;
};
export const bulkAddTransactions = (newTxs: Transaction[]) => {
    const txs = getAllTransactions();
    const updated = [...newTxs, ...txs];
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    return updated;
};

export const getAllAppointments = (): Appointment[] => loadFromStorage(STORAGE_KEYS.APPOINTMENTS, []);
export const addAppointment = (appt: Appointment) => {
    const appts = getAllAppointments();
    const updated = [appt, ...appts];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);
    return updated;
};
export const updateAppointment = (updatedAppt: Appointment) => {
    const appts = getAllAppointments();
    const updated = appts.map(a => a.id === updatedAppt.id ? updatedAppt : a);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);
    return updated;
};
export const deleteAppointment = (id: string) => {
    const appts = getAllAppointments();
    const updated = appts.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);
    return updated;
};

export const getAllTasks = (): Task[] => loadFromStorage(STORAGE_KEYS.TASKS, []);
export const addTask = (task: Task) => {
    const tasks = getAllTasks();
    const updated = [task, ...tasks];
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    return updated;
};
export const updateTask = (updatedTask: Task) => {
    const tasks = getAllTasks();
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    return updated;
};
export const deleteTask = (id: string) => {
    const tasks = getAllTasks();
    const updated = tasks.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    return updated;
};

// --- JOB & WORKER METHODS ---
export const getAllWorkers = (): Worker[] => loadFromStorage(STORAGE_KEYS.WORKERS, []);
export const addWorker = (worker: Worker) => {
    const workers = getAllWorkers();
    const updated = [worker, ...workers];
    saveToStorage(STORAGE_KEYS.WORKERS, updated);
    return updated;
};
export const updateWorker = (updatedWorker: Worker) => {
    const workers = getAllWorkers();
    const updated = workers.map(w => w.id === updatedWorker.id ? updatedWorker : w);
    saveToStorage(STORAGE_KEYS.WORKERS, updated);
    return updated;
};
export const deleteWorker = (id: string) => {
    const workers = getAllWorkers();
    const updated = workers.filter(w => w.id !== id);
    saveToStorage(STORAGE_KEYS.WORKERS, updated);
    return updated;
};

// --- PUBLIC WEBSITE REQUESTS ---
export const requestCallback = (name: string, phone: string, reason: string): string => {
    const workers = getAllWorkers();
    // Find designated worker or fallback to 'Business Owner'
    const assignedWorker = workers.find(w => w.receivesCallbacks) || { name: 'Business Owner' };

    const newTask: Task = {
        id: generateId(),
        text: `📞 Callback Request: ${name} (${phone}) - ${reason} [Assigned to: ${assignedWorker.name}]`,
        completed: false,
        reminder: true // Urgent reminder
    };
    
    // Add to admin dashboard tasks
    addTask(newTask);
    
    return assignedWorker.name;
};

export const getAllJobs = (): Job[] => loadFromStorage(STORAGE_KEYS.JOBS, []);

export const addJob = (job: Job) => {
  const jobs = getAllJobs();
  const updated = [job, ...jobs];
  saveToStorage(STORAGE_KEYS.JOBS, updated);
  return updated;
};

export const updateJob = (updatedJob: Job) => {
  const jobs = getAllJobs();
  const updated = jobs.map(j => j.id === updatedJob.id ? updatedJob : j);
  saveToStorage(STORAGE_KEYS.JOBS, updated);
  return updated;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);