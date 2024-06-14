#!/bin/bash

# Fungsi untuk menjalankan bun
run_bun() {
  echo "Menjalankan bun..."
  bun .
}

# Loop yang tidak pernah berakhir untuk memantau proses
while true; do
  # Jalankan fungsi run_bun
  run_bun
  
  # Periksa exit status dari proses terakhir
  EXIT_STATUS=$?
  
  # Jika exit status bukan 0, cetak pesan dan restart
  if [ $EXIT_STATUS -ne 0 ]; then
    echo "bun berhenti dengan status $EXIT_STATUS. Merestart dalam 5 detik..."
    sleep 5
  else
    # Jika exit status adalah 0, keluar dari loop
    echo "bun selesai dengan sukses."
    break
  fi
done
