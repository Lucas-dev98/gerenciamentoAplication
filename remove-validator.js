use epu_gestao;
db.runCommand({
  collMod: "notices",
  validator: {}
});
print("Notices collection validator removed");
