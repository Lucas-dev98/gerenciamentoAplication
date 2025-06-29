use epu_gestao;
db.notices.drop();
db.createCollection("notices");
print("Notices collection recreated without validator");
