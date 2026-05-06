public class Main {
    public static void main(String[] args) {

  const bounds = {
  minX: -10,
  maxX: 10,
  minZ: -10,
  maxZ: 10
};

player.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, player.position.x));
player.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, player.position.z));