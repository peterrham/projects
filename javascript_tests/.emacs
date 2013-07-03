(global-set-key "\C-x\C-m" 'execute-extended-command)
(global-set-key "\C-c\C-m" 'execute-extended-command)

(setq shell-file-name 'nil)

; (setq shell-file-name void)

(makunbound 'shell-file-name)

(setq shell-file-name nil)
     (defun my-shell-setup ()
       "For Cygwin bash under Emacs 20"
       (setq comint-scroll-show-maximum-output 'this)
       (make-variable-buffer-local 'comint-completion-addsuffix))
       (setq comint-completion-addsuffix t)
       ;; (setq comint-process-echoes t) ;; reported that this is no longer needed
       (setq comint-eol-on-send t)
       (setq w32-quote-process-args ?\")
(setq shell-mode-hook 'my-shell-setup)

(setq explicit-shell-file-name "c:\\win_bash\\bash.exe --login")
(setq explicit-shell-file-name "c:\\win_bash\\bash.exe")



;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;; Initial setup
	;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

	;; This assumes that Cygwin is installed in C:\cygwin (the
	;; default) and that C:\cygwin\bin is not already in your
	;; Windows Path (it generally should not be).

	(setq exec-path (cons "C:/cygwin/bin" exec-path))
	(setenv "PATH" (concat "C:\\cygwin\\bin;" (getenv "PATH")))

	;;   LOGNAME and USER are expected in many Emacs packages
	;;   Check these environment variables.

	(if (and (null (getenv "USER"))
		 ;; Windows includes variable USERNAME, which is copied to
		 ;; LOGNAME and USER respectively.
		 (getenv "USERNAME"))
	    (setenv "USER" (getenv "USERNAME")))

	(if (and (getenv "LOGNAME")
		 ;;  Bash shell defines only LOGNAME
		 (null (getenv "USER")))
	    (setenv "USER" (getenv "LOGNAME")))

	(if (and (getenv "USER")
		 (null (getenv "LOGNAME")))
	    (setenv "LOGNAME" (getenv "USER")))

	;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;; (A) M-x shell: This change M-x shell permanently
	;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

	;; Would call Windows command interpreter. Change it.

	(setq shell-file-name "bash")
	(setenv "SHELL" shell-file-name)
	(setq explicit-shell-file-name shell-file-name)

	;; Remove C-m (^M) characters that appear in output

	(add-hook 'comint-output-filter-functions
	          'comint-strip-ctrl-m)

	;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	;; (B) *OR* call following function with M-x my-bash
	;; The M-x shell would continue to run standard Windows shell
	;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

	(defun my-bash (&optional buffer)
	  "Run Cygwin Bash shell in optional BUFFER; default *shell-bash*."
	  (autoload 'comint-check-proc "comint")
	  (interactive
	   (let ((name "*shell-bash*"))
	     (if current-prefix-arg
		 (setq name (read-string
			     (format "Cygwin shell buffer (default %s): " name)
			     (not 'initial-input)
			     (not 'history)
			     name)))
	     (list name)))
	  (or buffer
	      (setq buffer "*shell-bash*"))
	  (if (comint-check-proc buffer)
	      (pop-to-buffer buffer)
	    (let* ((shell-file-name            "bash")
		   (explicit-shell-file-name   shell-file-name)
		   (explicit-sh-args           '("--login" "-i"))
		   (explicit-bash-args         explicit-sh-args)
		   (w32-quote-process-args     ?\"));; Use Cygwin quoting rules.
	      (shell buffer)
	      ;;  By default Emacs sends "\r\n", but bash wants plain "\n"
	      (set-buffer-process-coding-system 'undecided-dos 'undecided-unix)
	      ;; With TAB completion, add slash path separator, none to filenames
	      (make-local-variable 'comint-completion-addsuffix)
	      (setq comint-completion-addsuffix '("/" . ""))
	      ;;  This variable is local to buffer
	      (setq comint-prompt-regexp "^[ \n\t]*[$] ?"))))


; (insert (getenv "HOME"))C:\Users\peterham\AppData\RoamingC:\Users\peterham\AppData\Roaming

; C:\Users\peterham\AppData\RoamingC:\Users\peterham\AppData\Roaming

(defun rename-file-and-buffer (new-name)
  "Renames both current buffer and file it's visiting to NEW-NAME."
  (interactive "sNew name: ")
  (let ((name (buffer-name))
        (filename (buffer-file-name)))
    (if (not filename)
        (message "Buffer '%s' is not visiting a file!" name)
      (if (get-buffer new-name)
          (message "A buffer named '%s' already exists!" new-name)
        (progn
          (rename-file name new-name 1)
          (rename-buffer new-name)
          (set-visited-file-name new-name)
          (set-buffer-modified-p nil))))))
; C:\Users\peterham\AppData\RoamingC:\Users\peterham\AppData\Roaming

; very important to solve hangs/delays on windows!
(setq w32-get-true-file-attributes nil)
