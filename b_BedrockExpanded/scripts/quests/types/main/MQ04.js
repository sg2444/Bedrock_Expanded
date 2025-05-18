onComplete(player) {
  player.sendMessage(
    "§6[Quest] Kaelin nods gravely. 'If you're ready... the shrine awaits.'"
  );
  player.setDynamicProperty("echoesOfThePastComplete", true);

  // Automatically assign MQ03
  const nextQuest = new MQ03_TheFirstTrialQuest();
  QuestManager.assignQuest(player, nextQuest);
}
