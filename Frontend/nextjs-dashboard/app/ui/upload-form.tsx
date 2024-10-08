import {
    AtSymbolIcon,
    KeyIcon,
    ExclamationCircleIcon,
  } from '@heroicons/react/24/outline';
import '@/app/ui/stylesheets/login.css'
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import {useState} from 'react'

export default function FileUpload() {
    const [file,setFile] = useState<File>()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        try {

            alert('fileUpload of nextjs')
            const data = new FormData()
            data.set('file',file)

            const res = await fetch('http://localhost:3001/upload_file',{
                method:'POST',
                body:data
            })

            if(!res.ok) throw new Error(await res.text())

        } catch (e:any){
            console.error(e)
        }
    }

    return (
        <main>
            <form onSubmit={onSubmit}>
                <input
                    type="file"
                    name="file"
                    onChange={(e) => setFile(e.target.files?.[0])}
                    />
                <input type="submit" value="Upload"/>
            </form>
        </main>

    );

        
        
    
    
        


    

}