import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;
import java.awt.event.KeyEvent;
import java.awt.event.InputEvent;


public class Main extends JPanel {
    private static final int NUM_STARS = 200; // Number of stars to display
    private Point[] stars; // Array to hold star positions
    private Random random; // Random number generator

    public Main(int width, int height) {
        // Initialize the stars
        stars = new Point[NUM_STARS];
        random = new Random();
        for (int i = 0; i < NUM_STARS; i++) {
            int x = random.nextInt(width);
            int y = random.nextInt(height);
            stars[i] = new Point(x, y);
        }

        // Timer to update star positions
        Timer timer = new Timer(50, new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                moveStars();
                repaint(); // Repaint the panel
            }
        });
        timer.start(); // Start the timer
    }

    private void moveStars() {
        for (Point star : stars) {
            // Randomly change the position of each star
            star.x += random.nextInt(3) - 1; // Move -1, 0, or +1 in x direction
            star.y += random.nextInt(3) - 1; // Move -1, 0, or +1 in y direction

            // Keep stars within bounds
            if (star.x < 0) star.x = 0;
            if (star.x >= getWidth()) star.x = getWidth() - 1;
            if (star.y < 0) star.y = 0;
            if (star.y >= getHeight()) star.y = getHeight() - 1;
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        // Set the background color to black
        g.setColor(Color.BLACK);
        g.fillRect(0, 0, getWidth(), getHeight());

        // Draw the stars
        g.setColor(Color.GRAY);
        for (Point star : stars) {
            g.fillOval(star.x, star.y, 2, 2); // Draw each star as a small circle
        }
    }

    public static void main(String[] args) throws Exception {

        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        int width = (int) screenSize.getWidth();
        int height = (int) screenSize.getHeight();

        JFrame frame = new JFrame("Starry Galaxy");
        frame.setSize(1200, 768);
        frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);
        
        Main main = new Main(width, height);
        frame.add(main);
        frame.setVisible(true);

        while (!Thread.currentThread().isInterrupted()) {
		Robot robot = new Robot();
		robot.keyPress(KeyEvent.VK_SHIFT);
		robot.keyRelease(KeyEvent.VK_SHIFT);
	        robot.delay(60000);
        }
    }
}
