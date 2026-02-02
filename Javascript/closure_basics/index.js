//Basic Closure Example
function createCounter(){
    let count = 0; //Private Variable

    return{
        increment(){
            count++;
            return count;
        },decrement(){
            count--;
            return count;
        },getValue(){
            return count;
        }
    };
}

const counter = createCounter();
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.getValue());
//count is not accessible directly,its private

/*Advanced: module pattern with closures */
const BankAccount = (function(){
    const accounts = new Map();//~private storage

    return{
        createAccount(id,initialBalance){
            accounts.set(id,{balance:initialBalance,transactions:[]});
        },

        deposit(id,amount){
            const account = account.get(id);
                if(!account) throw new Error("Account not found");
                account.balance+=amount;
                account.transaction.push({type:'deposit',amount,date:new Date()});
        },
        withdraw(id,amount){
            const account = account.get(id);
            if(!account)throw new Error("Account not found");
            if(account.balance<amount) throw new Error("Insufficient funds");
            account.balance -= amount;
            account.transactions.push({type:'withdraw',amount,date:new Date() });
        },
        getBalance(id){
            const account = accounts.get(id)
            return account ? account.balance:null
        }
    };
})();
//usage
BankAccount.createAccount("user123",1000);
BankAccount.deposit("user123",500);
console.log(BankAccount.getBalance('user123'))