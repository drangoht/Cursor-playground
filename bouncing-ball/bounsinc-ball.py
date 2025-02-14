import pygame
import sys
import random
import math

# Initialize Pygame
pygame.init()

# Set up the display
width = 800
height = 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Bouncing Ball")

# Set up font for score
font = pygame.font.Font(None, 36)
score = 0

# Ball properties
ball_radius = 20
ball_x = width // 2
ball_y = height // 2
ball_speed_x = 5
ball_speed_y = 5
ball_trail = []  # Store previous positions for trail effect

# Bar properties
bar_width = 100
bar_height = 20
bar_x = width // 2 - bar_width // 2
bar_y = height - 40
bar_speed = 7
bar_glow = 0  # For glow effect when ball hits

# Brick properties
BRICK_COLORS = [
    (255, 87, 87),    # Red
    (255, 189, 87),   # Orange
    (255, 255, 87),   # Yellow
    (87, 255, 87),    # Green
    (87, 87, 255)     # Blue
]
BRICK_ROWS = 5
BRICK_COLS = 8
BRICK_WIDTH = width // BRICK_COLS
BRICK_HEIGHT = 30
BRICK_PADDING = 2

# Create bricks
bricks = []
for row in range(BRICK_ROWS):
    for col in range(BRICK_COLS):
        brick = {
            'rect': pygame.Rect(
                col * BRICK_WIDTH + BRICK_PADDING,
                row * BRICK_HEIGHT + BRICK_PADDING + 50,  # Start 50 pixels from top
                BRICK_WIDTH - 2 * BRICK_PADDING,
                BRICK_HEIGHT - 2 * BRICK_PADDING
            ),
            'color': BRICK_COLORS[row]
        }
        bricks.append(brick)

# Particles system
particles = []
class Particle:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.color = color
        self.size = random.randint(2, 5)
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(2, 5)
        self.dx = math.cos(angle) * speed
        self.dy = math.sin(angle) * speed
        self.life = 255

    def update(self):
        self.x += self.dx
        self.y += self.dy
        self.dy += 0.1  # Gravity
        self.life -= 10
        return self.life > 0

    def draw(self, screen):
        alpha = max(0, min(255, self.life))
        particle_surface = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
        pygame.draw.circle(particle_surface, (*self.color, alpha), (self.size, self.size), self.size)
        screen.blit(particle_surface, (int(self.x - self.size), int(self.y - self.size)))

# Screen shake
shake_offset = [0, 0]
shake_intensity = 0

# Colors
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GOLD = (255, 215, 0)

def add_particles(x, y, color, count=10):
    for _ in range(count):
        particles.append(Particle(x, y, color))

def apply_screen_shake():
    global shake_intensity
    if shake_intensity > 0:
        shake_offset[0] = random.randint(-int(shake_intensity), int(shake_intensity))
        shake_offset[1] = random.randint(-int(shake_intensity), int(shake_intensity))
        shake_intensity *= 0.9

# Game loop
running = True
clock = pygame.time.Clock()

while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Move bar with keyboard
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and bar_x > 0:
        bar_x -= bar_speed
    if keys[pygame.K_RIGHT] and bar_x < width - bar_width:
        bar_x += bar_speed

    # Update ball position
    ball_x += ball_speed_x
    ball_y += ball_speed_y
    
    # Store ball trail
    ball_trail.append((ball_x, ball_y))
    if len(ball_trail) > 10:
        ball_trail.pop(0)

    # Ball collision with bricks
    for brick in bricks[:]:  # Use slice copy to safely remove while iterating
        if brick['rect'].collidepoint(ball_x, ball_y):
            bricks.remove(brick)
            ball_speed_y *= -1
            score += 1
            add_particles(ball_x, ball_y, brick['color'], 15)
            shake_intensity = 4
            break

    # Ball collision with walls
    if ball_x <= ball_radius or ball_x >= width - ball_radius:
        ball_speed_x *= -1
        add_particles(ball_x, ball_y, RED)
        shake_intensity = 3
    if ball_y <= ball_radius:
        ball_speed_y *= -1
        add_particles(ball_x, ball_y, RED)
        shake_intensity = 3

    # Ball collision with bar
    if (ball_y >= bar_y - ball_radius and 
        ball_x >= bar_x and 
        ball_x <= bar_x + bar_width):
        # Calculate relative position of ball hit on the bar (0 to 1)
        relative_intersect = (ball_x - bar_x) / bar_width
        
        # Convert to angle between -60 and 60 degrees
        angle = (relative_intersect - 0.5) * math.pi * 2/3  # 120 degrees range (-60 to +60)
        
        # Calculate new velocities
        speed = math.sqrt(ball_speed_x**2 + ball_speed_y**2)  # Maintain current speed
        ball_speed_x = speed * math.sin(angle)
        ball_speed_y = -speed * math.cos(angle)  # Negative because y increases downward
        
        ball_y = bar_y - ball_radius  # Prevent ball from getting stuck
        bar_glow = 255  # Start glow effect
        add_particles(ball_x, ball_y, GOLD, 20)
        shake_intensity = 5

    # Ball falls below bar
    if ball_y >= height - ball_radius:
        ball_speed_y *= -1
        add_particles(ball_x, ball_y, RED)
        shake_intensity = 3

    # Update particles
    particles = [p for p in particles if p.update()]
    
    # Update effects
    apply_screen_shake()
    bar_glow = max(0, bar_glow - 10)

    # Clear screen
    screen.fill(WHITE)

    # Draw bricks
    for brick in bricks:
        pygame.draw.rect(screen, brick['color'], brick['rect'], border_radius=3)
        # Add a lighter highlight for 3D effect
        highlight = tuple(min(c + 50, 255) for c in brick['color'])
        pygame.draw.rect(screen, highlight, brick['rect'], width=2, border_radius=3)

    # Draw ball trail
    for i, (trail_x, trail_y) in enumerate(ball_trail):
        alpha = int((i / len(ball_trail)) * 155)
        trail_surface = pygame.Surface((ball_radius * 2, ball_radius * 2), pygame.SRCALPHA)
        pygame.draw.circle(trail_surface, (*RED, alpha), (ball_radius, ball_radius), ball_radius * (i / len(ball_trail)))
        screen.blit(trail_surface, (int(trail_x - ball_radius), int(trail_y - ball_radius)))

    # Draw particles
    for particle in particles:
        particle.draw(screen)

    # Draw bar with glow effect
    if bar_glow > 0:
        glow_surface = pygame.Surface((bar_width + 20, bar_height + 20), pygame.SRCALPHA)
        pygame.draw.rect(glow_surface, (*GOLD, bar_glow), (0, 0, bar_width + 20, bar_height + 20), border_radius=10)
        screen.blit(glow_surface, (bar_x - 10 + shake_offset[0], bar_y - 10 + shake_offset[1]))

    # Draw ball and bar with screen shake
    pygame.draw.rect(screen, BLUE, (bar_x + shake_offset[0], bar_y + shake_offset[1], bar_width, bar_height), border_radius=10)
    pygame.draw.circle(screen, RED, (int(ball_x + shake_offset[0]), int(ball_y + shake_offset[1])), ball_radius)

    # Draw score with glow effect
    score_text = font.render(f'Score: {score}', True, (0, 0, 0))
    score_rect = score_text.get_rect(topright=(width - 10, 10))
    screen.blit(score_text, score_rect)

    # Update display
    pygame.display.flip()

    # Control frame rate
    clock.tick(60)

pygame.quit()
sys.exit()