"use client"
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
} from '@/components/ui/card'



export default function Home() {
  const { loading, turnLoadingOn, turnLoadingOff } = useLoadingState()
  const { data, findBookByName } = useQueryBook()
  const [bookName, setBookName] = useState<string>("")

  function userQueriedForBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    findBookByName(bookName);
  }

  function handleBookNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setBookName(event.target.value)
  }

  return (
    <main className="max-w-screen p-6 flex flex-col justify-center items-center gap-2">
      <form onSubmit={userQueriedForBook} className="w-full flex justify-center items-center gap-4">
        <Input placeholder="Search for a book" value={bookName} onChange={handleBookNameChange} />
        <Button>Search</Button>
      </form>
      <section id="books-results" className="mt-4 max-w-6xl grid grid-cols-3 grid-rows-3 gap-2">
        {data.map(book => (
          <BookItem book={book} key={book.key} />
        ))}
      </section>
    </main>
  );
}

interface BookItemProps {
  book: Book
}

function BookItem(props: BookItemProps) {
  return (
    <Card key={props.book.key} className="min-h-36 h-full w-full flex flex-col justify-between items-start shadow-sm">
      <CardHeader>
        <CardTitle>{props.book.title}</CardTitle>
        <CardDescription>{props.book.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-start items-center flex-wrap gap-2">
          {props.book.subjects.map(subject => (
            <BookSubject subject={subject} key={subject} />
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">Last edition year of release: {props.book.lastPublishedYear}</p>
      </CardContent>
      <CardFooter>
        <Button>See More.</Button>
      </CardFooter>
    </Card>
  )
}

function BookSubject(props: { subject: string }) {
  return (
    <span className="bg-slate-50 rounded-full px-2 py-1 text-xs text-gray-500">{props.subject}</span>
  )
}

export type UseLoadingStateHook = {
  loading: boolean,
  turnLoadingOn: () => void,
  turnLoadingOff: () => void,
}

function useLoadingState(): UseLoadingStateHook {
  const [loading, setLoading] = useState<boolean>(true)

  function turnLoadingOn() {
    setLoading(true)
  }
  function turnLoadingOff() {
    setLoading(false)
  }

  return {
    loading,
    turnLoadingOn,
    turnLoadingOff,
  }
}

export type UseQueryBookStateHook = {
  data: Book[],
  error: string,
  findBookByName: (name: string) => void,
}

function useQueryBook(): UseQueryBookStateHook {
  const [data, setData] = useState<Book[]>([]);
  const [error, setError] = useState<string>("");

  function findBookByName(name: string): void {
    fetch(`${process.env.NEXT_PUBLIC_OPEN_LIBRARY_URL}/search.json?title=${encodeURIComponent(name)}&limit=10`)
      .then(response => response.json())
      .then(data => {
        setData(Book.array(data.docs))
      })
      .catch(error => {
        setError(error.message)
      });
  };


  return {
    data,
    error,
    findBookByName,
  }
}


// NOTE: Extract this to another file
type BookType = {
  key: string,
  title: string,
  subtitle: string,
  author_name: string[] | string
  subject: string[]
  cover_i: number
  publish_year: number[]
}

class Book {

  public readonly key: string
  public readonly title: string
  public readonly subtitle: string
  public readonly coverId: number

  readonly #publishYear: number[]
  readonly #subjects: string[]
  readonly #author: string | string[]

  constructor(args: BookType) {
    this.key = args.key
    this.title = args.title || "No title available"
    this.subtitle = args.subtitle || "No subtitle available"
    this.coverId = args.cover_i
    this.#subjects = args.subject
    this.#author = args.author_name || "No author available"
    this.#publishYear = args.publish_year || []
  }

  static json(json: BookType): Book {
    return new Book(json)
  }

  static array(array: BookType[]): Book[] {
    return array.map(Book.json)
  }

  findBookCover(size: "S" | "M" | "L"): Promise<string | void> {
    return fetch(`${process.env.NEXT_PUBLIC_OPEN_LIBRARY_COVER_URL}/b/id/${this.coverId}-${size}.jpg`)
      .then(response => response.blob())
      .then(blob => URL.createObjectURL(blob))
  }

  get lastPublishedYear() {
    this.#publishYear.sort()
    return this.#publishYear[this.#publishYear.length - 1]
  }

  get author() {
    if (this.#author && Array.isArray(this.#author)) {
      return this.#author.join()
    }
    return this.#author
  }

  get subjects() {
    if (Array.isArray(this.#subjects) && this.#subjects.length) {
      return this.#subjects
    }
    return []
  }

}
