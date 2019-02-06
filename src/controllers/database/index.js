const firebase = require("firebase");

const config = {
  apiKey: "AIzaSyCg2l2m9dwEJWP8gfrj4GVeiqqWGPXMPnw",
  authDomain: "elo-bank.firebaseapp.com",
  databaseURL: "https://elo-bank.firebaseio.com",
  projectId: "elo-bank",
  storageBucket: "elo-bank.appspot.com",
  messagingSenderId: "1016193516480"
};

const app = firebase.initializeApp(config);
const database = app.firestore();

class DB {
  static getAll = async (node,order,limit = 10) => {
    try {
      const dbv = database.collection(node);
      return dbv.orderBy(order, "desc").limit(limit).get();
    } catch (error) {
      console.log(error);
    }
  };
  static updateSaldo = async (key, tipo, valor) => {
    try {
      const collection = database.collection("desbravadores");
      let dbv;
      await collection.doc(key).get().then(doc => {
          if(doc.exists)
           dbv = { key: doc.id, ...doc.data() }
          else throw Error("Desbravador não encontrado")
      })
      let saldo = 0;
      switch (tipo) {
        case "credito":
          saldo = dbv.saldo + parseFloat(valor);
          break;
        case "debito":
          saldo = dbv.saldo - parseFloat(valor);
          break;
        default:
          break;
      }
      if (saldo < 0) {
        throw Error("Saldo insuficiente");
      }
      collection.doc(key).update({
        saldo: saldo
      });
      database.collection("transacoes").add({
        desbravador: dbv.nome,
        tipo,
        valor: parseFloat(valor),
        data: new Date()
      })
    } catch (error) {
      throw error;
    }
  };
  static register = async (nome, unidade) => {
    try {
      await database.collection("desbravadores").add({
        nome,
        unidade,
        saldo: 0
      });
    } catch (error) {
      throw error;
    }
  };
  static delete = async (node,key) => {
      try {
          database.collection(node).doc(key).delete()
      } catch(error){
          throw error
      }
  }
}

export default DB;
