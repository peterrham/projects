(add-hook 'shell-mode-hook 'ansi-color-for-comint-mode-on)
(add-hook 'shell-mode-hook 'ansi-color-for-comint-mode-off)
(setq ansi-color-names-vector
  ["black" "red" "green" "yellow" "PaleBlue" "magenta" "cyan" "white"])
(if (not (assoc 'tty-color-mode default-frame-alist))
    (push (cons 'tty-color-mode 'never) default-frame-alist))