import React, { useEffect, useState } from 'react'
import { Link, useLocation } from "react-router-dom"

export function APP_SPA(props) {
  const [content, setContent] = useState()
  useEffect(() => {
    loadExternalScript(props.src, () => {
      setContent(window.$docp_content)
      setTimeout(() => {
        window?.$docp_func?.()
        // highlight code after render
        window.Prism?.highlightAll()
        // scroll to top
        window.scrollTo(0, 0)
      })
    })
  }, [props.src])
  const currentPath = useLocation().pathname
  const hasSidebar = Array.isArray(window.$docp_sidebar) && window.$docp_sidebar.length > 0
  const sidebarWidth = hasSidebar ? 240 : 0
  const hasHeader = props.title || (Array.isArray(window.$docp_navbar) && window.$docp_navbar.length > 0)
  const mainMt = hasHeader ? 'mt-16' : 'mt-6'
  const sidebarTop = hasHeader ? 'top-16' : 'top-6'
  return (
    <>
      {hasHeader && <Header type='spa' links={window.$docp_navbar} {...props} />}
      <div className={'main-w my-0 mx-auto flex ' + mainMt}>
        {hasSidebar &&
          <div style={{ width: '240px' }} className={'mt-4 pl-4 height-without-header overflow-y-scroll sticky ' + sidebarTop}>
            {recursiveSidebar('spa', window.$docp_sidebar, currentPath)}
          </div>
        }
        <div className='markdown-body px-4 mb-16 box-border' style={{ width: `calc(100% - ${sidebarWidth}px)` }} dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </>
  )
}

export function APP_MPA(props) {
  const [content, setContent] = useState()
  useEffect(() => {
    setContent(window.$docp_content)
    setTimeout(() => {
      window?.$docp_func?.()
      // highlight code after render
      window.Prism?.highlightAll()
      // scroll to top
      window.scrollTo(0, 0)
    })
  }, [])
  const currentPath = useLocation().pathname
  const hasSidebar = Array.isArray(window.$docp_sidebar) && window.$docp_sidebar.length > 0
  const sidebarWidth = hasSidebar ? 240 : 0
  const hasHeader = props.title || (Array.isArray(window.$docp_navbar) && window.$docp_navbar.length > 0)
  const mainMt = hasHeader ? 'mt-16' : 'mt-6'
  const sidebarTop = hasHeader ? 'top-16' : 'top-6'
  return (
    <>
      {hasHeader && <Header type='mpa' links={window.$docp_navbar} {...props} />}
      <div className={'main-w my-0 mx-auto flex ' + mainMt}>
        {hasSidebar &&
          <div style={{ width: '240px' }} className={'mt-4 pl-4 height-without-header overflow-y-scroll sticky ' + sidebarTop}>
            {recursiveSidebar('mpa', window.$docp_sidebar, currentPath)}
          </div>
        }
        <div className='markdown-body px-4 mb-16 box-border' style={{ width: `calc(100% - ${sidebarWidth}px)` }} dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </>
  )
}

function Header(props) {
  const title = props.title
  const links = props.links || []
  const type = props.type
  return (
    <div className='w-screen fixed z-50 top-0 bg-white border-b border-slate-100'>
      <div className="main-w flex mx-auto">
        <div className='flex-1'>
          <a className="text-slate-700 px-4 py-2.5 block text-xl">{title}</a>
        </div>
        <div className='shrink-0'>
          {recursiveNavbar(type, links)}
        </div>
      </div>
    </div>
  )
}

function recursiveSidebar(type, links, current, depth = 0) {
  const listColor = depth === 0 ? 'text-slate-900' : 'text-slate-500'
  const listWeight = depth === 0 ? 'font-medium' : 'font-normal'
  const listSize = depth === 0 ? 'text-base' : 'text-sm'
  const ulPadding = depth === 0 ? 'pl-0' : 'pl-6'
  const ulMargin = depth === 0 ? 'mr-2' : 'mr-0'
  return (
    <ul className={`sidebar list-none ${ulPadding} ${ulMargin}`}>
      {links.map((link, index) => {
        let highlight = ''
        if (type === 'spa') {
          highlight = current === '/' + link.href ? 'highlight' : ''
        } else if (type === 'mpa') {
          // TODO add mpa menu highlight
          highlight = ''
        }
        const linkClassName = `${listSize} ${listWeight} ${listColor} ${highlight} rounded-lg py-2.5 pl-2 block hover:bg-gray-200`
        let linkItem = <Link className={linkClassName}>{link.value}</Link>
        if (link.href && type === 'spa') {
          linkItem = <Link className={linkClassName} to={'/' + link.href}>{link.value}</Link>
        } else if (link.href && type === 'mpa') {
          linkItem = <a className={linkClassName} href={link.href + '.html'}>{link.value}</a>
        }
        return (
          <li key={index}>
            {linkItem}
            {/* 如果当前项是一个数组，则表示需要创建一个子列表 */}
            {Array.isArray(link.children) && (
              recursiveSidebar(type, link.children, current, ++depth)
            )}
          </li>
        )
      })}
    </ul>
  )
}

function recursiveNavbar(type, links, depth = 0) {
  if (depth > 1) {
    return []
  }
  if (depth === 1) {
    return <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      {links.map(link => <li><a href={link.href}>{link.value}</a></li>)}
    </ul>
  }
  const listColor = depth === 0 ? 'text-slate-900' : 'text-slate-500'
  const listWeight = depth === 0 ? 'font-medium' : 'font-normal'
  const listSize = depth === 0 ? 'text-base' : 'text-sm'
  return (
    <ul className={`flex list-none`}>
      {links.map((link, index) => {
        const linkClassName = `${listSize} ${listWeight} ${listColor} py-2.5 px-4 block rounded-lg hover:bg-gray-200 flex`
        if (!link.href) {
          return <div className="dropdown dropdown-hover">
            <Link className={linkClassName}>{link.value}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </Link>
            {recursiveNavbar(type, link.children, ++depth)}
          </div>
        }
        let linkItem = <Link className={linkClassName} to={'/' + link.href}>{link.value}</Link>
        if (type === 'mpa') {
          linkItem = <a className={linkClassName} href={link.href + '.html'}>{link.value}</a>
        }
        return (
          <li key={index}>
            {linkItem}
            {/* 如果当前项是一个数组，则表示需要创建一个子列表 */}
            {Array.isArray(link.children) && (
              recursiveNavbar(type, link.children, ++depth)
            )}
          </li>
        )
      })}
    </ul>
  )
}

function loadExternalScript(src, callback) {
  const script = document.createElement('script')
  script.src = src
  script.id = 'external'
  script.type = 'text/javascript'
  const exist = document.querySelector('#external')
  script.onload = callback
  if (exist) {
    exist.parentNode.removeChild(exist)
  }
  document.body.appendChild(script)
}
