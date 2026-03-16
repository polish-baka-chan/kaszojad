const { Client, GatewayIntentBits } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const db = new sqlite3.Database("./casino.db");

db.run(`
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 money INTEGER
)
`);

const prefix="!";

function getUser(id,cb){
 db.get("SELECT * FROM users WHERE id=?",[id],(err,row)=>{
  if(!row){
   db.run("INSERT INTO users VALUES (?,100)",[id]);
   cb({id:id,money:100});
  } else cb(row);
 });
}

function setMoney(id,m){
 db.run("UPDATE users SET money=? WHERE id=?",[m,id]);
}

client.on("ready",()=>{
 console.log("Kaszojad działa");
});

client.on("messageCreate",(msg)=>{
 if(msg.author.bot) return;
 if(!msg.content.startsWith(prefix)) return;

 const args=msg.content.slice(prefix.length).split(" ");
 const cmd=args[0];

 getUser(msg.author.id,(user)=>{

  if(cmd==="bal"){
   msg.reply("💰 "+user.money);
  }

  if(cmd==="coin"){
   let bet=parseInt(args[1])||10;

   if(Math.random()<0.5){
    user.money+=bet;
    msg.reply("🪙 win "+bet);
   }else{
    user.money-=bet;
    msg.reply("💀 lose "+bet);
   }

   setMoney(user.id,user.money);
  }

  if(cmd==="top"){
   db.all("SELECT * FROM users ORDER BY money DESC LIMIT 10",(e,rows)=>{
    let text="🏆 ranking\n";
    rows.forEach((u,i)=>{
     text+=`${i+1}. <@${u.id}> — ${u.money}\n`;
    });
    msg.channel.send(text);
   });
  }

 });

});

client.login(""client.login(process.env.TOKEN));
