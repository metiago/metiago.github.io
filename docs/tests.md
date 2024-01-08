# Testing

`Arrange Act Assert` is a best practice to write readable and organized blocks of code.

```java
@Test
public void shouldFindAGameById() {
    // Arrage 
    final Game game = new Game();
    game.setId(GAME_ID);
    game.setTitle("Zelda");
    final Games games = new Games();
    when(entityManager.find(Game.class, GAME_ID)).thenReturn(game);
    
    // Act
    final Optional<Game> foundGame = games.findGameById(GAME_ID);

    // Assert
    verify(entityManager).find(Game.class, GAME_ID); 
    assertThat(foundGame).isNotNull().hasValue(game).usingFieldByFieldValueComparator();
}
```