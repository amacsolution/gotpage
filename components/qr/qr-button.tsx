'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AnimatePresence, motion } from "framer-motion"

import { Check, Copy, QrCode } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

export default function QrButton({ url, className }: { url: string, className?: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false)

  // Twórz nowy QR za każdym razem, gdy url się zmienia
  useEffect(() => {
    if (!url) return;
    qrCode.current = new QRCodeStyling({
      type: "canvas",
      shape: "square",
      width: 300,
      height: 300,
      data: url,
      margin: 10,
      qrOptions: {
        typeNumber: 5,
        mode: "Byte",
        errorCorrectionLevel: "H"
      },
      image: '/logo.png', // <-- poprawiona ścieżka
      imageOptions: {
        saveAsBlob: true,
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5
      },
      dotsOptions: {
        type: "classy-rounded",
        color: "#000000",
        roundSize: true,
        gradient: undefined
      },
    });
  }, [url]);

  // Renderuj QR do diva po otwarciu dialogu
  useEffect(() => {
    if (dialogOpen && qrRef.current && qrCode.current) {
      qrRef.current.innerHTML = "";
      qrCode.current.append(qrRef.current);
    }
  }, [dialogOpen, url]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!url) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" className={className}><QrCode className="mr-2"/>Udostępnij kod QR</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Twój kod QR</DialogTitle>
            <DialogDescription>
                Oto twój unikalny kod QR, który możesz pobrać lub wygenerować ponownie.
            </DialogDescription>
          </DialogHeader>
          <div
            ref={qrRef}
            id="qr-code" className="flex items-center justify-center w-full h-80 rounded-lg shadow-md overflow-hidden"
          ></div>
           <div className="flex items-center gap-2 bg-background border border-muted-foreground px-3 py-2 rounded-md w-full max-w-md">
            <input
              type="text"
              value={url}
              readOnly
              className="bg-transparent outline-none text-sm w-full"
            />
            <button
              onClick={copyToClipboard}
              className="text-foreground hover:text-foreground/50 transition"
              title="Skopiuj link"
            >
              {copied ? 
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 1,
                  scale: { type: "spring", visualDuration: 1, bounce: 0.5 }
                }}
              >
                <Check className="w-5 h-5 text-green-500" />
              </motion.div>
              : <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                duration: 1,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
            }}
              >
                <Copy className="w-5 h-5 text-foreground transition hover:text-foreground/50" />
              </motion.div> }

            </button>
          </div>
          <DialogFooter className="flex justify-between gap-2">
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button onClick={() => {
              qrCode.current?.download({
                name: "gotpage-qr",
                extension: "png",
              });
            }}>Pobierz QR</Button>
            <Button variant="secondary" onClick={() => {
              if (qrRef.current && url) {
                // Tworzymy nową instancję QRCodeStyling
                qrCode.current = new QRCodeStyling({
                  type: "canvas",
                  shape: "square",
                  width: 300,
                  height: 300,
                  data: url,
                  margin: 10,
                  qrOptions: {
                    typeNumber: 5,
                    mode: "Byte",
                    errorCorrectionLevel: "H"
                  },
                  image: '/logo.png',
                  imageOptions: {
                    saveAsBlob: true,
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 5
                  },
                  dotsOptions: {
                    type: "classy-rounded",
                    color: "#000000",
                    roundSize: true,
                    gradient: undefined
                  },
                });
                qrRef.current.innerHTML = "";
                qrCode.current.append(qrRef.current);
              }
            }}>Generuj nowy kod QR</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}