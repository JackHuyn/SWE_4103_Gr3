import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useState } from 'react'


//Author: Raphael Ferreira
export default function FileUpload({ localId, courseId }: { localId: string, courseId: string }) {
    const [file, setFile] = useState<File>()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        try {

            alert('fileUpload of nextjs')
            const data = new FormData()
            data.set('file', file)
            data.set('course_id', courseId)

            //Posts the uploaded file to the backend
            const res = await fetch('http://localhost:3001/upload_file', {
                method: 'POST',
                body: data
            })

            if (res.ok) {
                window.location.reload();

            } else {
                throw new Error(await res.text())
            }
        } catch (e: any) {
            console.error(e)
        }
    }

    return (
        <main className="file-upload-container">
            <form className="file-upload-form" onSubmit={onSubmit}>
                <label htmlFor="file-upload" className="file-upload-label">
                    Choose File
                </label>
                <input
                    type="file"
                    id="file-upload"
                    className="file-upload-input"
                    name="file"
                    onChange={(e) => {
                        setFile(e.target.files?.[0]);
                    }}
                />
                <div className="file-name">
                    {file ? file.name : "No file chosen"}
                </div>
                <button type="submit" className="upload-button">
                    Upload
                </button>
            </form>
        </main>

    );










}