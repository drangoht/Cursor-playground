; Food Survivor Game in NASM syntax
BITS 16
ORG 100h

section .text
    global start

start:
    ; Set up segments
    mov ax, cs
    mov ds, ax
    mov es, ax
    
    ; Initialize stack
    mov ax, 0
    mov ss, ax
    mov sp, 0FFFEh

    ; Jump to main program
    jmp main

section .data
    ; Player data
    playerX     dw  40     ; Adjusted starting X position
    playerY     dw  12     ; Adjusted starting Y position
    playerChar  db  1      ; Smiley face character
    playerColor db  0Eh    ; Yellow color
    playerHealth db 100    ; Player health
    playerPower  db 1      ; Player power level
    score       dw  0      ; Player score
    gameOver    db  0      ; Game over flag

    ; Enemy data
    ENEMY_MAX   equ 8
    enemyX      times 8 dw 0
    enemyY      times 8 dw 0
    enemyActive times 8 db 0
    enemyType   times 8 db 0

    ; Screen boundaries
    SCREEN_WIDTH  equ 80
    SCREEN_HEIGHT equ 25
    SCREEN_START  equ 0B800h   ; Video memory start

    ; Enemy types
    ENEMY_TYPES equ 4
    enemyChars  db  3, 4, 5, 6  ; Different enemy characters
    enemyColors db  04h, 02h, 0Ch, 06h  ; Red, Green, Light Red, Brown
    enemyDamage db  10, 15, 20, 25      ; Damage per enemy type
    enemyPoints db  10, 20, 30, 40      ; Score points per enemy

    ; Messages
    titleMsg    db  'FOOD SURVIVOR', 13, 10, '$'
    scoreMsg    db  'Score: ', '$'
    healthMsg   db  'HP: ', '$'
    gameOverMsg db  'Game Over! Press R to restart', 13, 10, '$'

section .text
main:
    ; Set video mode (80x25 text mode)
    mov ax, 0003h
    int 10h

    ; Hide cursor
    mov ah, 1
    mov cx, 2000h
    int 10h

    ; Initialize game
    call init_game

game_loop:
    ; Check for game over
    cmp byte [gameOver], 0
    jne near game_over

    ; Clear screen
    call clear_screen

    ; Handle input
    call handle_input

    ; Update game state
    call update_game

    ; Draw screen
    call draw_screen

    ; Add delay
    mov cx, 1
    mov dx, 0
    mov ah, 86h
    int 15h

    ; Check for ESC key to exit
    mov ah, 1
    int 16h
    jz game_loop
    
    mov ah, 0
    int 16h
    cmp al, 27  ; ESC key
    je exit_game
    
    jmp game_loop

init_game:
    ; Reset player position
    mov word [playerX], 40
    mov word [playerY], 12
    mov byte [playerHealth], 100
    mov word [score], 0
    mov byte [gameOver], 0

    ; Clear enemies
    mov cx, ENEMY_MAX
    xor si, si
.clear_enemies:
    mov byte [enemyActive + si], 0
    inc si
    loop .clear_enemies
    ret

clear_screen:
    mov ax, 0003h    ; Text mode 80x25, 16 colors
    int 10h
    ret

handle_input:
    mov ah, 1
    int 16h
    jz .done

    mov ah, 0
    int 16h

    cmp al, 'a'
    je .move_left
    cmp al, 'd'
    je .move_right
    cmp al, 'w'
    je .move_up
    cmp al, 's'
    je .move_down
    jmp .done

.move_left:
    cmp word [playerX], 1
    jle .done
    dec word [playerX]
    jmp .done

.move_right:
    cmp word [playerX], SCREEN_WIDTH-2
    jge .done
    inc word [playerX]
    jmp .done

.move_up:
    cmp word [playerY], 1
    jle .done
    dec word [playerY]
    jmp .done

.move_down:
    cmp word [playerY], SCREEN_HEIGHT-2
    jge .done
    inc word [playerY]

.done:
    ret

update_game:
    push ax
    push bx
    push cx
    push dx

    ; Update enemies
    mov cx, ENEMY_MAX
    xor si, si

.enemy_loop:
    cmp byte [enemyActive + si], 0
    je .next_enemy

    ; Move enemy towards player
    mov ax, [enemyX + si]
    cmp ax, [playerX]
    jg .move_left
    jl .move_right

.move_left:
    dec word [enemyX + si]
    jmp .check_y

.move_right:
    inc word [enemyX + si]

.check_y:
    mov ax, [enemyY + si]
    cmp ax, [playerY]
    jg .move_up
    jl .move_down

.move_up:
    dec word [enemyY + si]
    jmp .check_collision

.move_down:
    inc word [enemyY + si]

.check_collision:
    ; Check collision with player
    mov ax, [enemyX + si]
    sub ax, [playerX]
    cmp ax, 2
    jg .no_collision
    cmp ax, -2
    jl .no_collision

    mov ax, [enemyY + si]
    sub ax, [playerY]
    cmp ax, 1
    jg .no_collision
    cmp ax, -1
    jl .no_collision

    ; Collision detected - damage player
    movzx bx, byte [enemyType + si]
    mov al, [enemyDamage + bx]
    sub [playerHealth], al
    jnz .no_collision
    mov byte [gameOver], 1

.no_collision:
.next_enemy:
    inc si
    loop .enemy_loop

    pop dx
    pop cx
    pop bx
    pop ax
    ret

draw_screen:
    ; Draw title
    mov dx, titleMsg
    mov ah, 9
    int 21h

    ; Draw player
    mov ah, 2
    mov dh, byte [playerY]
    mov dl, byte [playerX]
    int 10h
    
    mov ah, 9
    mov al, [playerChar]
    mov bl, [playerColor]
    mov cx, 1
    int 10h

    ; Draw enemies
    mov cx, ENEMY_MAX
    xor si, si

.draw_enemy_loop:
    cmp byte [enemyActive + si], 0
    je .next_draw_enemy

    mov ah, 2
    mov dh, byte [enemyY + si]
    mov dl, byte [enemyX + si]
    int 10h
    
    movzx bx, byte [enemyType + si]
    mov ah, 9
    mov al, [enemyChars + bx]
    mov bl, [enemyColors + bx]
    mov cx, 1
    int 10h

.next_draw_enemy:
    inc si
    loop .draw_enemy_loop

    ; Draw score
    mov ah, 2
    mov dh, 0
    mov dl, 70
    int 10h
    
    mov dx, scoreMsg
    mov ah, 9
    int 21h

    mov ax, [score]
    call print_number
    ret

print_number:
    push ax
    push bx
    push cx
    push dx

    mov bx, 10
    xor cx, cx

.divide:
    xor dx, dx
    div bx
    push dx
    inc cx
    test ax, ax
    jnz .divide

.print:
    pop dx
    add dl, '0'
    mov ah, 2
    int 21h
    loop .print

    pop dx
    pop cx
    pop bx
    pop ax
    ret

game_over:
    ; Display game over screen
    mov ah, 0Fh
    mov al, 3
    int 10h

    ; Print game over message
    mov dx, gameOverMsg
    mov ah, 09h
    int 21h

    ; Wait for 'R' key
.wait_restart:
    mov ah, 0
    int 16h
    
    cmp al, 'r'
    je start
    cmp al, 'R'
    je start
    
    jmp .wait_restart 

exit_game:
    ; Return to DOS
    mov ax, 4C00h
    int 21h

; Pad to make a valid COM file
    times 510-($-$$) db 0
    dw 0AA55h 